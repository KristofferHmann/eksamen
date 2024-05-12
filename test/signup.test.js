// Importerer alle funktioner fra chai biblioteket
import * as chai from 'chai';
// Importerer chaiHttp for at kunne lave HTTP requests i vores tests
import chaiHttp from 'chai-http';
// Importerer signup funktionen fra vores signup.js fil
import { signup } from '../src/signup.js';

// Bruger chaiHttp middleware med chai
chai.use(chaiHttp);
// Destructurerer expect funktionen fra chai, så vi kan bruge den til at lave assertions
const {expect} = chai;

// Laver en mock af den globale fetch funktion, så vi kan simulere HTTP requests i vores tests
global.fetch = async () => ({
    ok: true
});

// Beskriver en test suite for brugerregistrering
describe('User Registration', () => {
    // Definerer en test, der skal tjekke om en ny bruger kan registreres
    it('should register a new user', async () => {
        // Laver en mock af brugerdata for en testbruger
        const userData = {
            username: 'testUser',
            password: 'testPassword123',
            weight: 70,
            age: 25,
            gender: 'male'
        };

        try {
            // Kalder signup funktionen med vores testbrugerdata og gemmer svaret
            const response = await signup(userData);
            // Forventer at svaret er sandt, hvilket indikerer at brugerregistreringen var succesfuld
            expect(response).to.be.true; 
        } catch (error) {
            // Kaster en fejl, hvis testen fejler, fx hvis svaret ikke er sandt
            throw new Error('Test failed:', error); 
        }
    });
});