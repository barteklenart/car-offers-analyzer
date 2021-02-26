(() => {
  const button = document.querySelector('#button');
  button.addEventListener('click', async () => {
    const inputData = document.querySelector('#input').value;
    if (!inputData) return;
    const cover = document.querySelector('.cover');
    cover.classList.add('cover--active');
    try {
      const blob = await(
        await fetch('/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: inputData,
          })
        })
      ).blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "carlist.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove()
    } catch (error) {
    } finally {
      cover.classList.remove('cover--active');
    }
  });
})()