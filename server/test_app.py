import io
import time
import numpy as np
import pytest
import soundfile as sf
from fastapi.testclient import TestClient
import app as studio


class Wave:
    def squeeze(self): return self
    def cpu(self): return self
    def numpy(self): return np.sin(np.arange(24000) * .07).astype('float32') * .1


class Engine:
    sr = 24000
    def generate(self, text, **kwargs): return Wave()
    def prepare_conditionals(self, path): pass


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(studio, 'DATA', tmp_path)
    monkeypatch.setattr(studio, 'model', Engine())
    studio.sessions.clear()
    studio.jobs.clear()
    with TestClient(studio.app) as client:
        yield client


def auth(client):
    token = client.post('/api/sessions').json()['token']
    return {'Authorization': 'Bearer ' + token}


def wav(seconds=21, silence=False):
    samples = np.zeros(24000 * seconds) if silence else np.sin(np.arange(24000 * seconds) * .05) * .1
    out = io.BytesIO()
    sf.write(out, samples, 24000, format='WAV')
    return out.getvalue()


def upload(client, headers, data=None, consent='true'):
    data = data if data is not None else wav()
    return client.post('/api/voices', headers=headers, data={'consent': consent}, files=[('samples', ('reading.wav', data, 'audio/wav')) for _ in range(3)])


def wait(client, headers, job):
    for _ in range(100):
        result = client.get('/api/jobs/' + job, headers=headers).json()
        if result['status'] in ('completed', 'failed'): return result
        time.sleep(.05)
    raise AssertionError('Job did not finish')


def test_no_voice_without_session_or_consent(client):
    assert upload(client, {}).status_code == 401
    headers = auth(client)
    assert upload(client, headers, consent='false').status_code == 400


def test_approval_and_private_narration_flow(client):
    owner, stranger = auth(client), auth(client)
    response = upload(client, owner)
    assert response.status_code == 200
    result = response.json(); vid, jid = result['voice_id'], result['job_id']
    assert wait(client, owner, jid)['status'] == 'completed'
    assert client.get('/api/jobs/' + jid, headers=stranger).status_code == 404
    assert client.get(f'/api/voices/{vid}/preview', headers=stranger).status_code == 404
    assert client.post('/api/narrations', headers=owner, json={'voice_id': vid, 'text': 'Goodnight.'}).status_code == 409
    assert client.post(f'/api/voices/{vid}/approve', headers=owner).status_code == 409
    preview = client.get(f'/api/voices/{vid}/preview', headers=owner)
    assert preview.status_code == 200 and preview.content.startswith(b'RIFF')
    assert client.post(f'/api/voices/{vid}/approve', headers=owner).status_code == 200
    narration = client.post('/api/narrations', headers=owner, json={'voice_id': vid, 'text': 'The moon is bright. Goodnight.'})
    job = narration.json()['job_id']; assert wait(client, owner, job)['status'] == 'completed'
    audio = client.get(f'/api/jobs/{job}/audio', headers=owner)
    assert audio.content.startswith(b'RIFF') and audio.headers['cache-control'] == 'no-store'
    assert client.get(f'/api/jobs/{job}/audio', headers=stranger).status_code == 404
    assert client.delete('/api/session', headers=owner).json()['deleted']
    assert client.get(f'/api/jobs/{job}/audio', headers=owner).status_code == 401


@pytest.mark.parametrize('audio,expected', [(b'',400),(b'not audio',200),(wav(2),200),(wav(21,True),200)], ids=['empty','invalid','short','silent'])
def test_bad_audio_cannot_create_ready_voice(client,audio,expected):
    headers = auth(client); response = upload(client,headers,audio)
    assert response.status_code == expected
    if expected == 200:
        result = wait(client, headers, response.json()['job_id'])
        assert result['status'] == 'failed'
        assert client.post(f"/api/voices/{response.json()['voice_id']}/approve", headers=headers).status_code == 409


def test_short_total_rejected(client):
    headers = auth(client); response = upload(client,headers,wav(16))
    result = wait(client,headers,response.json()['job_id'])
    assert result['status'] == 'failed' and '60 seconds' in result['error']


def test_cross_origin_rejected(client):
    assert client.post('/api/sessions', headers={'Origin':'https://unrelated.example'}).status_code == 403


def test_text_chunking_preserves_content():
    text = 'A quiet evening. ' * 150
    chunks = studio.split_text(text)
    assert all(len(chunk)<=350 for chunk in chunks)
    assert ' '.join(chunks).split() == text.split()


def test_expired_session_cannot_access_audio(client):
    headers = auth(client); token = headers['Authorization'][7:]
    studio.sessions[token]['touched'] -= studio.TTL + 1
    assert client.get('/api/jobs/anything',headers=headers).status_code == 401
    studio.expire_sessions()
    assert token not in studio.sessions
