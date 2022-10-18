import { useMemo } from 'react'
import Head from 'next/head'
import { parse } from 'rss-to-json'

import { useAudioPlayer } from '@/components/AudioProvider'
import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'
import { PlayButton } from '@/components/player/PlayButton'
import Recorder from '@/components/recorder'

export default function Episode({ episode }) {
  let date = new Date(episode.published)

  let audioPlayerData = useMemo(
    () => ({
      title: episode.title,
      audio: {
        src: episode.audio.src,
        type: episode.audio.type,
      },
      link: `/${episode.id}`,
    }),
    [episode]
  )
  let player = useAudioPlayer(audioPlayerData)

  return (
    <>
      <Head>
        <title>{`${episode.title} - Their Side`}</title>
        <meta name="description" content={episode.description} />
      </Head>
      <article className="py-16 lg:py-36">
        <Container>
          <Recorder />
        </Container>
      </article>
    </>
  )
}

export async function getStaticProps({ params }) {
  let feed = await parse('https://their-side-feed.vercel.app/api/feed')
  let episode = feed.items
    .map(({ id, title, description, content, enclosures, published }) => ({
      id: id.toString(),
      title: `${id}: ${title}`,
      description,
      content,
      published,
      audio: enclosures.map((enclosure) => ({
        src: enclosure.url,
        type: enclosure.type,
      }))[0],
    }))
    .find(({ id }) => id === params.episode)

  if (!episode) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      episode,
    },
    revalidate: 10,
  }
}

export async function getStaticPaths() {
  let feed = await parse('https://their-side-feed.vercel.app/api/feed')

  return {
    paths: feed.items.map(({ id }) => ({
      params: {
        episode: id.toString(),
      },
    })),
    fallback: 'blocking',
  }
}
