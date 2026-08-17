// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2606-FTB-CT-WEB-PT"; // Make sure to change this!
const API = BASE + COHORT;

let puppies = [];
let selectedPuppy;
let teams = [];

async function getPuppies() {
  try {
    const response = await fetch(API + "/players");
    const result = await response.json();
    puppies = result.data.players;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getPuppy(id) {
  try {
    const response = await fetch(API + `/players/${id}`);
    const result = await response.json();
    selectedPuppy = result.data.player;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function addPuppy(puppy) {
  try {
    await fetch(API + "/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(puppy),
    });
    getPuppies();
  } catch (e) {
    console.error(e);
  }
}

async function removePuppy(id) {
  try {
    await fetch(API + `/players/${id}`, {
      method: "DELETE",
    });
    selectedPuppy = undefined;
    getPuppies();
  } catch (e) {
    console.error(e);
  }
}

async function getTeams() {
  try {
    const response = await fetch(API + "/teams");
    const result = await response.json();
    teams = result.data.teams;
  } catch (e) {
    console.error(e);
  }
}

function PuppyInRoster(puppy) {
  const $li = document.createElement("li");

  if (puppy.id === selectedPuppy?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#details">
      <figure class="puppyCard">
        <img src="${puppy.imageUrl}" alt="Picture of ${puppy.name}" />
        <p>${puppy.name}</p>
      </figure>
      
    </a>
  `;

  $li.addEventListener("click", () => getPuppy(puppy.id));

  return $li;
}

function Roster() {
  const $ul = document.createElement("ul");
  $ul.classList.add("roster");

  const $puppies = puppies.map(PuppyInRoster);
  $ul.replaceChildren(...$puppies);

  return $ul;
}

function NewPuppyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Breed
      <input name="breed" required />
    </label>
    <label>
      Status
      <select name="status">
        <option value="bench">Bench</option>
        <option value="field">Field</option>
      </select>
    </label>
    <label>
      Team
      <select name="team">
        <option default value="">Unassigned</option>
      </select>
    </label>
    <label>
      Image URL
      <input name="imageUrl" />
    </label>
    <button>Invite puppy</button>
  `;

  const $options = teams.map(TeamChoice);
  $form.querySelector(`select[name="team"]`).append(...$options);

  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData($form);
    addPuppy({
      name: data.get("name"),
      breed: data.get("breed"),
      status: data.get("status"),
      teamId: data.get("team"),
      imageUrl: data.get("imageUrl"),
    });
  });

  return $form;
}

function TeamChoice(team) {
  const $option = document.createElement("choice");
  $option.value = team.id;
  $option.textContent = team.name;
  return $option;
}

function PuppyDetails() {
  if (!selectedPuppy) {
    const $p = document.createElement("p");
    $p.classList.add("details");
    $p.textContent = "Please select a puppy to see more details.";
    return $p;
  }

  const $details = document.createElement("section");
  $details.classList.add("details");

  $details.innerHTML = `
    <figure>
      <img
        src="${selectedPuppy.imageUrl}"
        alt="Picture of ${selectedPuppy.name}"
      />
    </figure>
    <div>
      <dl>
        <div><dt>Name</dt><dd>${selectedPuppy.name}</dd></div>
        <div><dt>ID</dt><dd>${selectedPuppy.id}</dd></div>
        <div><dt>Breed</dt><dd>${selectedPuppy.breed}</dd></div>
        <div><dt>Team</dt><dd>${
          selectedPuppy.team?.name ?? "Unassigned"
        }</dd></div>
        <div><dt>Status</dt><dd>${selectedPuppy.status}</dd></div>
      </dl>
      <button>Remove from roster</button>
    </div>
  `;

  const $delete = $details.querySelector("button");
  $delete.addEventListener("click", () => removePuppy(selectedPuppy.id));

  return $details;
}

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Puppy Bowl</h1>
    <main>
      <section id="roster">
        <h2>Roster</h2>
        <Roster></Roster>
        <h3>Invite a puppy</h3>
        <NewPuppyForm></NewPuppyForm>
      </section>
      <section id="details">
        <h2>Puppy details</h2>
        <PuppyDetails></PuppyDetails>
      </section>
      <a href="#roster" id="top">Back to roster</a>
    </main>
  `;
  $app.querySelector("Roster").replaceWith(Roster());
  $app.querySelector("NewPuppyForm").replaceWith(NewPuppyForm());
  $app.querySelector("PuppyDetails").replaceWith(PuppyDetails());
}

async function init() {
  await getPuppies();
  await getTeams();
  render();
}

init();
