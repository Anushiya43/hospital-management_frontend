const url = 'https://example.com/auth/callback?user=%7B%22sub%22%3A7%2C%22email%22%3A%22anushiyavcse04%40gmail.com%22%2C%22role%22%3A%22PATIENT%22%7D';
const params = new URLSearchParams(url.split('?')[1]);
const userStr = params.get('user');
console.log('userStr:', userStr);
try {
    const parsed = JSON.parse(userStr);
    console.log('parsed:', parsed);
} catch (e) {
    console.log('JSON.parse failed without decode');
}
try {
    const decoded = decodeURIComponent(userStr);
    console.log('decoded:', decoded);
    const parsed = JSON.parse(decoded);
    console.log('parsed with decode:', parsed);
} catch (e) {
    console.log('JSON.parse failed with decode');
}
