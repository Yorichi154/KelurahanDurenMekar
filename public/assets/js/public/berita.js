async function loadBerita() {
    const container = document.getElementById("beritaContainer");

    if (!container) return;

    try {
        const response = await fetch("/api/public/berita", {
            headers: {
                Accept: "application/json",
            },
        });

        const berita = await response.json();

        if (!berita.length) {
            container.innerHTML = `
                <div class="empty-state">
                    Belum ada berita tersedia.
                </div>
            `;

            return;
        }

        container.innerHTML = berita
            .map(
                (item) => `

            <article class="berita-card">

                ${
                    item.image
                        ? `<img src="${item.image}" alt="${item.title}" class="berita-thumb" onerror="this.style.display='none';">`
                        : ""
                }

                <div class="berita-content">

                    <span class="berita-category">
                        ${item.category}
                    </span>

                    <h3>
                        ${item.title}
                    </h3>

                    <small>
                        ${item.date}
                    </small>

                    <p>
                        ${item.excerpt ?? ""}
                    </p>

                </div>

            </article>

        `,
            )
            .join("");
    } catch (error) {
        console.error("Gagal memuat berita:", error);

        container.innerHTML = `
            <div class="error-state">
                Gagal memuat data berita
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadBerita);
