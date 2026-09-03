import Link from 'next/link';
import { CardGenerator } from '@/components/CardGenerator';
import { SiteHeader } from '@/components/SiteHeader';
import styles from './page.module.css';

const STEPS = [
  {
    title: 'Escribe tu usuario',
    body: 'Solo el nombre público de tu cuenta de GitHub o Chess.com. Nada de contraseñas ni permisos.',
  },
  {
    title: 'Identika lee tus datos',
    body: 'Tu navegador nunca habla con la API externa. El servidor pide los datos públicos y calcula tu nivel, rango y porcentajes.',
  },
  {
    title: 'Se revela tu credencial',
    body: 'La tarjeta aparece bajo el lector, con efecto 3D, anverso y reverso, y su número de serie.',
  },
  {
    title: 'Compártela o descárgala',
    body: 'Un link público con imagen de preview, o un PNG. Con cuenta, queda guardada en «Mis tarjetas».',
  },
];

const PIECES = [
  { term: 'Nivel calculado', desc: 'Tus stats no son un volcado crudo: se traducen a un nivel y un rango.' },
  { term: 'Anverso y reverso', desc: 'Datos al frente; desglose y aviso de que no es un documento oficial detrás.' },
  { term: 'Número de serie', desc: 'Determinístico a partir de tu usuario, como el de un carnet.' },
  { term: 'Efecto 3D', desc: 'La tarjeta se inclina siguiendo el cursor, con brillo.' },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.pitch}>
            <h1 className={styles.title}>Pasa tu GitHub o tu Chess.com por el lector.</h1>
            <p className={styles.lede}>
              Escribe tu usuario y Identika lee tus datos públicos para generar tu credencial al
              momento — con tus stats, tu nivel y tu número de serie. Compártela por link o
              descárgala.
            </p>
          </div>

          <CardGenerator context="home" />
        </section>

        <section className={styles.section} aria-labelledby="incluye">
          <h2 id="incluye" className={styles.h2}>Qué lleva la credencial</h2>
          <dl className={styles.pieces}>
            {PIECES.map((p) => (
              <div key={p.term} className={styles.piece}>
                <dt>{p.term}</dt>
                <dd>{p.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="pasos">
          <h2 id="pasos" className={styles.h2}>De un usuario a una credencial</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footNote}>
            <strong>Solo datos públicos.</strong> Nunca pedimos contraseñas ni permisos de más, y una
            tarjeta no es un documento de identidad oficial.
          </div>
          <div className={styles.footLinks}>
            <span>Próximo: YouTube</span>
            <Link href="/entrar">Entrar</Link>
            <a href="https://claude.ai/code/artifact/8e18840b-487c-4b26-9c3b-1b23afeeda59" target="_blank" rel="noreferrer">
              Roadmap
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
