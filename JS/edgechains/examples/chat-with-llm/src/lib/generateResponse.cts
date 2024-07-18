const { OpenAI } = require("@arakoodev/edgechains.js/openai");
import { z } from "zod";

const schema = z.object({
    answer: z.string().describe("The answer to the question"),
});

// ** Example schema for a horse object, You can unComment the following code if you want to test the complex schema based answer**
// const genderOrStage = ["mare", "stallion", "gelding", "foal"]; // Example values
// const breed = ["arabian", "thoroughbred", "quarter horse", "appaloosa"]; // Example values

// const schema = z.object({
//     isAdvertisingSaleOfHorse: z
//         .boolean()
//         .describe("Whether the text is advertising the sale of a horse."),
//     genderOrStage: z
//         .enum(genderOrStage as any)
//         .nullable()
//         .describe(`The gender or stage of the horse, which MUST be one of ${genderOrStage.join(", ")}.`),
//     age: z.number().nullable().describe("The age of the horse in years."),
//     height: z.number().nullable().describe("The height of the horse in hands."),
//     breed: z
//         .enum(breed as any)
//         .describe(`The breed of the horse, which MUST be one of ${breed.join(", ")}.`),
//     gaited: z.boolean().describe("Whether the horse is gaited or not."),
//     temperament: z
//         .enum(["alpha", "other"])
//         .describe('The temperament of the horse, either "alpha" indicating it is top of the herd, or "other".'),
// });

async function openAICall({ prompt, openAIApiKey }: any) {
    try {
        const openai = new OpenAI({ apiKey: openAIApiKey });
        let res = await openai.zodSchemaResponse({ prompt, schema: schema });
        return JSON.stringify(res);
    } catch (error) {
        return error;
    }
}

module.exports = openAICall;
