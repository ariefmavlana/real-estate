"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagerProperties = exports.updateManager = exports.createManager = exports.getManager = void 0;
const client_1 = require("@prisma/client");
const wkt_1 = require("@terraformer/wkt");
const prisma = new client_1.PrismaClient();
const getManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const manager = yield prisma.manager.findUnique({
            where: { cognitoId }
        });
        if (manager) {
            res.json(manager);
        }
        else {
            res.status(404).json({ message: "Manager not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: `Error Retrieving Manager: ${error.message}` });
    }
});
exports.getManager = getManager;
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const manager = yield prisma.manager.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber
            }
        });
        res.status(201).json(manager);
    }
    catch (error) {
        res.status(500).json({ message: `Error Creating Manager: ${error.message}` });
    }
});
exports.createManager = createManager;
const updateManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;
        const updateManager = yield prisma.manager.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber
            }
        });
        res.json(updateManager);
    }
    catch (error) {
        res.status(500).json({ message: `Error Updating Manager: ${error.message}` });
    }
});
exports.updateManager = updateManager;
const getManagerProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const properties = yield prisma.property.findMany({
            where: { managerCognitoId: cognitoId },
            include: {
                location: true,
            }
        });
        const propertiesWithFormattedLocation = yield Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) AS coordinates FROM "Location" WHERE id = ${property.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(coordinates[0].coordinates || "");
            const latitude = geoJSON.coordinates[0];
            const longitude = geoJSON.coordinates[1];
            return Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                        latitude,
                        longitude,
                    } }) });
        })));
        res.json(propertiesWithFormattedLocation);
    }
    catch (err) {
        res.status(500).json({ message: `Error Retrieving Manager Properties: ${err.message}` });
    }
});
exports.getManagerProperties = getManagerProperties;
