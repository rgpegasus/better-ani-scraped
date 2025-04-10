import { getLatestEpisodes } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
    const new_episodes = await getLatestEpisodes("animesama", "vostfr");
    console.log(new_episodes);
};

main().catch(console.error);
