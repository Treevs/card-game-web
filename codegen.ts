import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "http://localhost:4000/graphql",
    documents: ["**/graphql/*.graphql"],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        "src/generated/generates.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-apollo",
                "typescript-resolvers",
                "typescript-apollo-client-helpers",
                "fragment-matcher",
            ],
            config: {
                fetcher: "fetch",
                exposeFetcher: true,
                exposeQueryKeys: true,
                exposeQueryOptions: true,
            },
        },
    },
};

export default config;
