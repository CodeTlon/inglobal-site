import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { transcodeWithService, isTranscodePreset } from '../../lib/transcode-client'

function server(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void) {
  return new Promise<{ url: string; close: () => void }>((resolve) => {
    const s = http.createServer(handler).listen(0, '127.0.0.1', () =>
      resolve({ url: `http://127.0.0.1:${(s.address() as AddressInfo).port}`, close: () => s.close() }),
    )
  })
}
const original = Buffer.alloc(1000, 1)

test('sin configuración devuelve null (se guarda el original)', async () => {
  delete process.env.TRANSCODE_SERVICE_URL
  delete process.env.TRANSCODE_API_KEY
  assert.equal(await transcodeWithService(original), null)
})

test('comprime: manda la API key y el preset, devuelve el mp4', async () => {
  let auth = '', url = ''
  const s = await server((req, res) => {
    auth = req.headers.authorization ?? ''
    url = req.url ?? ''
    req.resume().on('end', () => res.end(Buffer.alloc(100, 2)))
  })
  process.env.TRANSCODE_SERVICE_URL = s.url + '/'
  process.env.TRANSCODE_API_KEY = 'k-test'
  const out = await transcodeWithService(original, 'web')
  s.close()
  assert.equal(out?.length, 100)
  assert.equal(auth, 'Bearer k-test')
  assert.equal(url, '/v1/transcode?preset=web')
})

test('soft-fail: error del servicio, resultado más pesado o servicio caído -> null', async () => {
  process.env.TRANSCODE_API_KEY = 'k'
  const caido = await server((_q, r) => r.destroy())
  process.env.TRANSCODE_SERVICE_URL = caido.url
  assert.equal(await transcodeWithService(original), null)
  caido.close()

  const err = await server((q, r) => q.resume().on('end', () => { r.statusCode = 422; r.end('{}') }))
  process.env.TRANSCODE_SERVICE_URL = err.url
  assert.equal(await transcodeWithService(original), null)
  err.close()

  const pesado = await server((q, r) => q.resume().on('end', () => r.end(Buffer.alloc(5000))))
  process.env.TRANSCODE_SERVICE_URL = pesado.url
  assert.equal(await transcodeWithService(original), null)
  pesado.close()
})

test('presets válidos', () => {
  assert.equal(isTranscodePreset('hero'), true)
  assert.equal(isTranscodePreset('../etc'), false)
  assert.equal(isTranscodePreset(undefined), false)
})
