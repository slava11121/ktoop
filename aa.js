class BrokenVehicleError extends Error {
    constructor(message) {
        super(message);
        this.name = "BrokenVehicleError";
    }
}

class Vehicle {
    static nextId = 1;

    #id;
    #brand;
    #model;
    #year;
    #broken = false;

    constructor(brand, model, year) {
        if (!Vehicle.validateYear(year)) {
            throw new Error("Некорректный год");
        }

        this.#id = Vehicle.nextId++;
        this.#brand = brand;
        this.#model = model;
        this.#year = year;
    }

    static validateYear(year) {
        return year >= 1886 && year <= new Date().getFullYear();
    }

    get id() {
        return this.#id;
    }

    get brand() {
        return this.#brand;
    }

    get model() {
        return this.#model;
    }

    get year() {
        return this.#year;
    }

    get broken() {
        return this.#broken;
    }

    breakDown() {
        this.#broken = true;
    }

    repair() {
        this.#broken = false;
    }

    checkBroken() {
        if (this.#broken) {
            throw new BrokenVehicleError(
                `${this.#brand} ${this.#model} сломан`
            );
        }
    }

    move() {
        throw new Error("Метод move() должен быть переопределен");
    }

    getType() {
        return "Транспорт";
    }
}


class Car extends Vehicle {
    #seats;

    constructor(brand, model, year, seats) {
        super(brand, model, year);
        this.#seats = seats;
    }

    move() {
        this.checkBroken();
        return `Автомобиль ${this.brand} ${this.model} едет`;
    }

    getType() {
        return "Автомобиль";
    }
}


class ElectricCar extends Car {
    #battery;

    constructor(brand, model, year, battery) {
        super(brand, model, year, 5);
        this.#battery = battery;
    }

    move() {
        this.checkBroken();
        return `Электромобиль ${this.brand} ${this.model} едет на электричестве`;
    }

    getType() {
        return "Электромобиль";
    }
}


class Truck extends Vehicle {
    #maxLoad;

    constructor(brand, model, year, maxLoad) {
        super(brand, model, year);
        this.#maxLoad = maxLoad;
    }

    move() {
        this.checkBroken();
        return `Грузовик ${this.brand} ${this.model} перевозит груз`;
    }

    getType() {
        return "Грузовик";
    }
}


class Motorcycle extends Vehicle {
    #sidecar;

    constructor(brand, model, year, sidecar) {
        super(brand, model, year);
        this.#sidecar = sidecar;
    }

    move() {
        this.checkBroken();

        if (this.#sidecar) {
            return `Мотоцикл ${this.brand} ${this.model} едет с коляской`;
        }

        return `Мотоцикл ${this.brand} ${this.model} едет`;
    }

    getType() {
        return "Мотоцикл";
    }
}


class Garage {
    #vehicles = [];

    add(vehicle) {
        this.#vehicles.push(vehicle);
    }

    remove(id) {
        this.#vehicles = this.#vehicles.filter(vehicle => vehicle.id !== id);
    }

    find(id) {
        return this.#vehicles.find(vehicle => vehicle.id === id);
    }

    getAll() {
        return [...this.#vehicles];
    }

    startAll() {
        this.#vehicles.forEach(vehicle => {
            try {
                addLog(vehicle.move());
            } catch (error) {
                addLog(error.message);
            }
        });
    }
}


const garage = new Garage();

const type = document.getElementById("type");
const brand = document.getElementById("brand");
const model = document.getElementById("model");
const year = document.getElementById("year");
const extra = document.getElementById("extra");
const extraLabel = document.getElementById("extraLabel");
const extraField = document.getElementById("extraField");
const sidecarField = document.getElementById("sidecarField");
const sidecar = document.getElementById("sidecar");
const error = document.getElementById("error");
const table = document.getElementById("vehicleTable");
const log = document.getElementById("log");


type.addEventListener("change", () => {
    sidecarField.hidden = true;
    extraField.hidden = false;

    if (type.value === "car") {
        extraLabel.textContent = "Количество мест";
        extra.value = 5;
    }

    if (type.value === "electric") {
        extraLabel.textContent = "Батарея";
        extra.value = 75;
    }

    if (type.value === "truck") {
        extraLabel.textContent = "Грузоподъемность";
        extra.value = 5000;
    }

    if (type.value === "motorcycle") {
        extraField.hidden = true;
        sidecarField.hidden = false;
    }
});


document.getElementById("addButton").addEventListener("click", () => {
    try {
        error.textContent = "";

        if (!brand.value || !model.value || !year.value) {
            throw new Error("Заполните все поля");
        }

        let vehicle;

        if (type.value === "car") {
            vehicle = new Car(
                brand.value,
                model.value,
                Number(year.value),
                Number(extra.value)
            );
        }

        if (type.value === "electric") {
            vehicle = new ElectricCar(
                brand.value,
                model.value,
                Number(year.value),
                Number(extra.value)
            );
        }

        if (type.value === "truck") {
            vehicle = new Truck(
                brand.value,
                model.value,
                Number(year.value),
                Number(extra.value)
            );
        }

        if (type.value === "motorcycle") {
            vehicle = new Motorcycle(
                brand.value,
                model.value,
                Number(year.value),
                sidecar.checked
            );
        }

        garage.add(vehicle);

        addLog(
            `Добавлен: ${vehicle.getType()} ${vehicle.brand} ${vehicle.model}`
        );

        clearForm();
        render();

    } catch (e) {
        error.textContent = e.message;
    }
});


document.getElementById("startAllButton").addEventListener("click", () => {
    garage.startAll();
});


function render() {
    table.innerHTML = "";

    garage.getAll().forEach(vehicle => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${vehicle.id}</td>
            <td>${vehicle.getType()}</td>
            <td>${vehicle.brand}</td>
            <td>${vehicle.model}</td>
            <td>${vehicle.year}</td>
            <td>${vehicle.broken ? "Сломан" : "Исправен"}</td>
            <td>
                <button onclick="startVehicle(${vehicle.id})">Запустить</button>
                <button onclick="breakVehicle(${vehicle.id})">Сломать</button>
                <button onclick="repairVehicle(${vehicle.id})">Ремонт</button>
                <button onclick="deleteVehicle(${vehicle.id})">Удалить</button>
            </td>
        `;

        table.appendChild(row);
    });
}


function startVehicle(id) {
    const vehicle = garage.find(id);

    try {
        addLog(vehicle.move());
    } catch (e) {
        error.textContent = e.message;
        addLog(e.message);
    }
}


function breakVehicle(id) {
    const vehicle = garage.find(id);

    vehicle.breakDown();

    addLog(`${vehicle.brand} ${vehicle.model} сломан`);
    render();
}


function repairVehicle(id) {
    const vehicle = garage.find(id);

    vehicle.repair();

    addLog(`${vehicle.brand} ${vehicle.model} отремонтирован`);
    render();
}


function deleteVehicle(id) {
    garage.remove(id);

    addLog("Транспорт удален");
    render();
}


function addLog(message) {
    log.innerHTML += `<div>${message}</div>`;
}


function clearForm() {
    brand.value = "";
    model.value = "";
    year.value = "";
    sidecar.checked = false;
}