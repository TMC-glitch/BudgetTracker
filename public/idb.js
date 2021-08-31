const indexdb = window.indexedDB;
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
    let db = e.target.result;

    db.createObjectStore("transaction", { autoIncrement: true });
}
request.onsuccess = (e) => {
    db = e.target.result;
    if (navigator.onLine) addTransactions();
}
request.onerror = (e) => {
    console.log("Error", e.target.errorCode);
}
function saveRecord(record) {
    const transaction = db.transaction(["transaction"], "readwrite");
    const store = transaction.objectStore("transaction");
    store.add(record);
}
function addTransactions() {
    const transaction = db.transaction(["transaction"], "readwrite");
    const store = transaction.objectStore("transaction");
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        console.log(getAll.result.length);
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => {
                return response.json();
            }).then(() => {
                const transaction = db.transaction(["transaction"], "readwrite");
                const store = transaction.objectStore("transaction");
                store.clear();
            });
        }
    }
}

window.addEventListener("online", addTransactions)