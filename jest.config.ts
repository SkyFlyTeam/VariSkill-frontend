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
        "\\.(svg|png|jpe?g|gif|webp)$": "<rootDir>/src/tests/fileMock.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
}

export default config
