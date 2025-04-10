import { getLatestEpisodes, getRandomAnime } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
    const new_episodes = await getLatestEpisodes("animesama", "vostfr");
    console.log(new_episodes);

    const random_episode = await getRandomAnime("animesama");
    console.log(random_episode);
};

main().catch(console.error);
