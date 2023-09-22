import path from 'path'
import os from 'os'
import fs from 'fs'

import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { SSM } from '@aws-sdk/client-ssm'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

const ssm = new SSM()

let app

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event)
  if (!app) {
    const filePath = path.join(os.tmpdir(), 'serviceAccountKey.json')
    if (!fs.existsSync(filePath)) {
      const file = await ssm.getParameter({ Name: '/push/serviceAccountKey' })
      if (file.Parameter?.Value) {
        fs.writeFileSync(filePath, file.Parameter?.Value)
      }
    }
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath
    app = initializeApp({ credential: applicationDefault() })
  }

  const body = JSON.parse(event.body || '{}')

  const response = await getMessaging(app).send({
    token: body.registrationToken,
    notification: {
      title: body.title,
      body: body.body,
    },
  })

  await getMessaging(app).send({
    token: body.registrationToken,
    webpush: {
      notification: {
        title: body.title,
        body: body.body,
      },
    },
  })

  console.log(response)

  return JSON.stringify({ message: 'ok' })
}
