import Head from 'next/head'

import { Container } from '@/components/Container'
import Recorder from '@/components/recorder'

export default function Episode() {
  return (
    <>
      <Head>
        <title>audio-to-markdown - Steamship Package Demo</title>
        <meta name="description" content="A quick day-long hack of an audio-to-markdown converter using Whisper and hosted on Steamship." />
      </Head>
      <article className="py-16 lg:py-36">
        <Container>
          <Recorder />
        </Container>
      </article>
    </>
  )
}
