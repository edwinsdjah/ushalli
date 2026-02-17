const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', err => {
        reject(err);
      });
  });
}

async function check() {
  const lat = -6.2088; // Jakarta
  const lon = 106.8456;
  const date = '18-02-2026'; // Approx first day of Ramadan 1447H
  const tune = '0,1,0,2,3,2,0,2,0';

  // 1. Timings API (Used by Home Page logic)
  const urlTimings = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=20&tune=${tune}`;

  // 2. Hijri Calendar API (Used by Ramadan Page)
  // Checking for 09-1447 (Ramadan 1447)
  // We need to find the specific day (1st Ramadan) in the array.
  const urlHijri = `https://api.aladhan.com/v1/hijriCalendar/1447/9?latitude=${lat}&longitude=${lon}&method=20&tune=${tune}`;

  try {
    console.log('Fetching Timings...');
    const resTimings = await fetchJson(urlTimings);
    const t1 = resTimings.data.timings;

    console.log('Fetching Hijri Calendar...');
    const resHijri = await fetchJson(urlHijri);
    const days = resHijri.data;

    // Find the day matching 18-02-2026
    const dayMatch = days.find(d => d.date.gregorian.date === '18-02-2026');

    if (!dayMatch) {
      console.error('Could not find 18-02-2026 in Hijri Calendar response');
      console.log('First day in response:', days[0]?.date?.gregorian?.date);
      return;
    }

    const t2 = dayMatch.timings;

    console.log('\n--- COMPARISON (18 Feb 2026) ---');
    console.log('Timings API vs Hijri Calendar API');
    ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
      const time1 = t1[p].split(' ')[0]; // Remove (WIB) suffix if present
      const time2 = t2[p].split(' ')[0];
      const match = time1 === time2 ? 'MATCH' : 'MISMATCH';
      console.log(`${p}: ${time1} vs ${time2} -> ${match}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
