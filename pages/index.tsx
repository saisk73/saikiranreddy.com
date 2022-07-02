import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Sai Kiran Reddy</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <div className="container">
        <h1 className="home__heading">Hi There!</h1>
        <h2 className="home__subheading">I&apos;m Sai Kiran Reddy Uppula.</h2>
        <p className="home__description">
          I&apos;m a software engineer based in the United States. I&apos;m
          currently studying Masters in MIS at the University of Memphis. I love
          to solve complex engineering problems. I&apos;m currently working on
          technologies React.js, Nodejs, Vue.js, Django, Docker, Kubernetes,
          AWS, GCP, CDK, Java, TypeScript, and more.
        </p>
        <p className="home__description">
          I love to watch movies, read blogs (mostly about tech), explore new
          cuisines and, explore new places.
        </p>
        <p className="home__contact">
          <p>
            <b>You contact me at :</b>
          </p>{" "}
          <a href="mailto:hello@saikiranreddy.com" className="home__email">
            hello@saikiranreddy.com
          </a>
        </p>
      </div>

      <footer></footer>
    </div>
  );
};

export default Home;
