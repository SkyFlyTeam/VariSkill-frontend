import React from "react"

import {
    CodeBlocksQuestion,
    type CodeBlocksQuestionProps,
} from "@/components/shared/CodeBlocksQuestion/CodeBlocksQuestion"
import {
    FillCodeBlankQuestion,
    type FillCodeBlankQuestionProps,
} from "@/components/shared/FillCodeBlankQuestion/FillCodeBlankQuestion"
import {
    MultipleChoiceQuestion,
    type MultipleChoiceQuestionProps,
} from "@/components/shared/MultipleChoiceQuestion/MultipleChoiceQuestion"

export type QuestionProps =
    | { tipo: "MULTIPLA_ESCOLHA"; question: MultipleChoiceQuestionProps }
    | { tipo: "ORDENAR_BLOCOS"; question: CodeBlocksQuestionProps }
    | { tipo: "COMPLETE_CODIGO"; question: FillCodeBlankQuestionProps }

export const Question: React.FC<QuestionProps> = (props) => {
    switch (props.tipo) {
        case "MULTIPLA_ESCOLHA":
            return <MultipleChoiceQuestion {...props.question} />
        case "ORDENAR_BLOCOS":
            return <CodeBlocksQuestion {...props.question} />
        case "COMPLETE_CODIGO":
            return <FillCodeBlankQuestion {...props.question} />
    }
}
