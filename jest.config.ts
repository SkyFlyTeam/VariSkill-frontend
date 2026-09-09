import type { Config } from "jest"

const config: Config = {
    testEnvironment: "jsdom",

    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],

    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.test.json",
            },
        ],
    },

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
}

export default config
