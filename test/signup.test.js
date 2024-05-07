import * as chai from 'chai';
import chaiHttp from 'chai-http';
import { signup } from '../src/signup.js';


chai.use(chaiHttp);
const {expect} = chai;

// Mock af global fetch funktion
global.fetch = async () => ({
    ok: true
});

describe('User Registration', () => {
    it('should register a new user', async () => {
        // mock af testbruger
        const userData = {
            username: 'testUser',
            password: 'testPassword123',
            weight: 70,
            age: 25,
            gender: 'male'
        };

        try {
            const response = await signup(userData);
            expect(response).to.be.true; // Forventer at functionen signup er sand
        } catch (error) {
            throw new Error('Test failed:', error); //Ved Error såsom expect(response).to.be.false: "Error test failed"
        }
    });
});
