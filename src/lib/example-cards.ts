import type { CardData } from './connectors/types';

/**
 * Tarjetas de ejemplo para el home — snapshots reales tomados de la API el
 * 2026-09-02. Se muestran en la sección "Ejemplos" y sirven de demo; al pulsar
 * una, se carga esa plataforma + usuario en el generador.
 */
export interface ExampleCard {
  card: CardData;
  accent: string;
}

export const EXAMPLE_CARDS: ExampleCard[] = [
  {
    accent: '#8b7bff',
    card: {
      platform: 'github',
      handle: 'torvalds',
      displayName: 'Linus Torvalds',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      location: 'Portland, OR',
      suggestedAccent: '#8b7bff',
      rank: 'Nivel 10 · Leyenda',
      stats: [
        { key: 'repos', label: 'Repos', value: '12', icon: 'repo' },
        { key: 'stars', label: 'Estrellas', value: '259,1 k', icon: 'star' },
        { key: 'language', label: 'C', value: '89%', icon: 'language' },
      ],
      breakdownTitle: 'Lenguajes principales',
      breakdown: [
        { name: 'C', percent: 89, color: '#8899aa' },
        { name: 'OpenSCAD', percent: 11, color: '#8899aa' },
      ],
      profileUrl: 'https://github.com/torvalds',
      serial: 'CB11-0C79-GH',
      issuedAt: '2026-09-02T22:19:08.987Z',
    },
  },
  {
    accent: '#81b64c',
    card: {
      platform: 'chess',
      handle: 'magnuscarlsen',
      displayName: 'GM Magnus Carlsen',
      avatarUrl:
        'https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.200x200o.361c2f8a59c2.jpg',
      location: 'Norway',
      suggestedAccent: '#81b64c',
      rank: 'Nivel 10 · Gran Maestro',
      breakdownTitle: 'Rendimiento por ritmo',
      breakdown: [
        { name: 'Blitz', percent: 74, color: '#f4c04e' },
        { name: 'Bullet', percent: 23, color: '#e8735c' },
        { name: 'Rapid', percent: 3, color: '#81b64c' },
      ],
      stats: [
        { key: 'rating-rapid', label: 'Rapid', value: '2941', icon: 'trophy' },
        { key: 'rating-blitz', label: 'Blitz', value: '3319', icon: 'flame' },
        { key: 'winrate', label: 'Victorias', value: '70%', icon: 'star' },
        { key: 'games', label: 'Partidas', value: '9,3 K', icon: 'play' },
      ],
      profileUrl: 'https://www.chess.com/member/MagnusCarlsen',
      serial: 'E622-22CB-CH',
      issuedAt: '2026-09-02T22:19:11.278Z',
    },
  },
  {
    accent: '#8b7bff',
    card: {
      platform: 'github',
      handle: 'sindresorhus',
      displayName: 'Sindre Sorhus',
      avatarUrl: 'https://avatars.githubusercontent.com/u/170270?v=4',
      suggestedAccent: '#8b7bff',
      rank: 'Nivel 10 · Leyenda',
      stats: [
        { key: 'repos', label: 'Repos', value: '1,1 K', icon: 'repo' },
        { key: 'stars', label: 'Estrellas', value: '992,1 k', icon: 'star' },
        { key: 'language', label: 'JavaScript', value: '80%', icon: 'language' },
      ],
      breakdownTitle: 'Lenguajes principales',
      breakdown: [
        { name: 'JavaScript', percent: 80, color: '#f4d35e' },
        { name: 'TypeScript', percent: 7, color: '#4f9dff' },
        { name: 'Swift', percent: 7, color: '#8899aa' },
      ],
      profileUrl: 'https://github.com/sindresorhus',
      serial: '548E-D62F-GH',
      issuedAt: '2026-09-02T22:19:10.986Z',
    },
  },
  {
    accent: '#81b64c',
    card: {
      platform: 'chess',
      handle: 'hikaru',
      displayName: 'GM Hikaru Nakamura',
      avatarUrl:
        'https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png',
      location: 'Florida',
      suggestedAccent: '#81b64c',
      rank: 'Nivel 10 · Gran Maestro',
      breakdownTitle: 'Rendimiento por ritmo',
      breakdown: [
        { name: 'Blitz', percent: 68, color: '#f4c04e' },
        { name: 'Bullet', percent: 31, color: '#e8735c' },
        { name: 'Rapid', percent: 1, color: '#81b64c' },
      ],
      stats: [
        { key: 'rating-rapid', label: 'Rapid', value: '2838', icon: 'trophy' },
        { key: 'rating-blitz', label: 'Blitz', value: '3370', icon: 'flame' },
        { key: 'winrate', label: 'Victorias', value: '79%', icon: 'star' },
        { key: 'games', label: 'Partidas', value: '66,5 k', icon: 'play' },
      ],
      profileUrl: 'https://www.chess.com/member/Hikaru',
      serial: 'B771-C29A-CH',
      issuedAt: '2026-09-02T22:19:11.438Z',
    },
  },
];
