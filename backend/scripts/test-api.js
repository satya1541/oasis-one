async function testApi() {
  const cookie = 'oasis_sid=0e03a7ab-5f00-4403-8421-0ff014836ac1';
  try {
    const res = await fetch('http://localhost:7500/api/v1/admin/applications', {
      headers: {
        'Cookie': cookie,
      }
    });

    console.log('HTTP STATUS:', res.status, res.statusText);
    const body = await res.text();
    console.log('RESPONSE BODY:', body);
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

testApi();
