console.log("AGENDA JS BERHASIL DIMUAT");
async function renderAgendaPublic() {
    console.log("Agenda Loaded");
    const container = document.getElementById("agendaPublic");

    if (!container) return;

    try {
        const response = await fetch("/api/public/agenda");

        const agenda = await response.json();

        container.innerHTML = agenda
            .map(
                (item) => `

                <li class="agenda-card">

                    <div class="agenda-date">
                        ${item.date}
                    </div>

                    <h3>${item.title}</h3>

                    <p>${item.location}</p>

                    <span>
                        ${item.time}
                    </span>

                </li>

            `,
            )
            .join("");
    } catch (error) {
        console.error(error);
    }
}

async function renderAgenda() {
    return renderAgendaPublic();
}
