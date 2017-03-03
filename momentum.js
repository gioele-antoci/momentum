fetch('https://jsonplaceholder.typicode.com/users')
    .then(function (response) {
    return response.text();
}).then(function (body) {
    document.body.innerHTML = body;
});
//# sourceMappingURL=momentum.js.map