/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jsdom",

    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],

    transform: {
        "^.+\\.(t|j)sx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.test.json",
                diagnostics: false,
            },
        ],
    },

    transformIgnorePatterns: [
        "node_modules/(?!(?:react-markdown|remark|rehype|hast|mdast|micromark|unist|vfile|unified|devlop|lowlight|property-information|comma-separated-tokens|space-separated-tokens|character-entities|decode-named-character-reference|style-to-object|html-url-attributes|stringify-entities|bail|trough|is-plain-obj|trim-lines|longest-streak|markdown-table|escape-string-regexp|ccount|zwitch|estree-util|extend|fault))",
    ],

    moduleNameMapper: {
        "\\.(svg|png|jpe?g|gif|webp)$": "<rootDir>/src/tests/fileMock.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
}
