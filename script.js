const locationName = "Jakarta";
const predictionDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

document.getElementById('location').textContent = locationName;
document.getElementById('date').textContent = predictionDate;

const API_KEY = 'db49599c56e54f7d92723933241012';
const city = 'Jakarta';
const days = 15;

const loader = document.getElementById('loader');

async function fetchRainData() {
    try {
        loader.style.display = 'block';

        const today = new Date();
        const datePromises = [];

        for (let i = 1; i <= days; i++) {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - i);
            const formattedDate = pastDate.toISOString().split('T')[0];

            const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city}&dt=${formattedDate}`;
            datePromises.push(fetch(apiUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }));
        }

        const results = await Promise.all(datePromises);

        const rainData = results.map(data => {
            if (data && data.forecast && data.forecast.forecastday && data.forecast.forecastday[0].day) {
                return data.forecast.forecastday[0].day.totalprecip_mm;
            } else {
                return 0;
            }
        }).reverse();

        return rainData;
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Terjadi kesalahan saat mengambil data curah hujan.');
        return [];
    } finally {
        loader.style.display = 'none';
    }
}

function applyRK2(actualData) {
    const h = 1;
    let t = 0;
    let y = actualData[0];

    const predictedData = [y];

    function f(t, y) {
        const trend = 0.1;
        return trend;
    }

    for (let i = 1; i < actualData.length; i++) {
        const k1 = f(t, y);
        const k2 = f(t + h, y + h * k1);
        y = y + (h / 2) * (k1 + k2);
        predictedData.push(y);
        t += h;
    }

    return predictedData;
}

function createChart(actualData, predictedData) {
    const ctx = document.getElementById('rainChart').getContext('2d');
    const rainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: actualData.map((_, index) => `Hari ${index + 1}`),
            datasets: [
                {
                    label: 'Curah Hujan Aktual (mm)',
                    data: actualData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Prediksi Curah Hujan (mm)',
                    data: predictedData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Simulasi Prediksi Curah Hujan di ${locationName} dengan Metode RK2`,
                    color: '#ffffff',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#333333',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ffffff',
                    borderWidth: 1
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Hari',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444444'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Curah Hujan (mm)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444444'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

window.addEventListener('load', async () => {
    const actualData = await fetchRainData();
    if (actualData.length > 0) {
        const predictedData = applyRK2(actualData);
        createChart(actualData, predictedData);
    }
});
