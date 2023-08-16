"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_MAZE_BASE_URL = "http://api.tvmaze.com";
const DEFAULT_IMG_URL = "https://tinyurl.com/tv-missing";
const DISPLAY_MAX_EPISODES = 10;


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 */

async function getShowsByTerm(searchTerm) {

  const params = new URLSearchParams({ q: searchTerm });
  const response = await fetch(`${TV_MAZE_BASE_URL}/search/shows?${params}`);
  console.log("response=", response);
  const showsData = await response.json();

  return showsData.map(showEntry => (
    // pull showEntry.show out to a variable
    {
      id: showEntry.show.id,
      name: showEntry.show.name,
      summary: showEntry.show.summary,
      image: (showEntry.show.image !== null)
        ? showEntry.show?.image.medium
        : DEFAULT_IMG_URL
    }
  ));
}
// optional chaining - insert ?


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {

  // const params = new URLSearchParams (id);
  const response = await fetch(`${TV_MAZE_BASE_URL}/shows/${id}/episodes`);
  const data = await response.json();

  console.log(data);

  return data.map(episode => (
    {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number

    }

  ));
}

/** Given list of episodes, display DISPLAY_MAX_EPISODES in episode area */

function displayEpisodes(episodes) {
  $episodesArea.empty();

  const maxEpisodes = episodes.length < DISPLAY_MAX_EPISODES
    ? episodes.length : DISPLAY_MAX_EPISODES;

  for (let i = 0; i < maxEpisodes; i++) {
    const $episode = $(`
    <li id="${episodes[i].id}">${episodes[i].name}
    (season ${episodes[i].season},
      number ${episodes[i].number})</li>
    `);

    $episodesArea.append($episode);
  };
}


/** Gets episodes from API based on ID of show.
 * Displays episodes.
 */

async function searchAndDisplayEpisodes(id) {
  const episodes = await getEpisodesOfShow(id);

  $episodesArea.show();
  displayEpisodes(episodes);

}

/** Handle click of show episodes button.
 * Get ID of that show to get correct episodes.
 */

$showsList.on("click", "button", async function handleClick(evt) {
  const id = $(evt.target).closest('[data-show-id]').data().showId;
  console.log("id=", id);

  searchAndDisplayEpisodes(id);
})

//.attr("data-show-id")