declare module "graphiql-explorer" {
    import type { GraphQLSchema } from "graphql";

    interface GraphiQLExplorerProps {
        schema: GraphQLSchema;
        query: string;
        onEdit: (query: string) => void;
        onRunOperation: () => void;
        explorerIsOpen: boolean;
        styles?: {
            buttonStyle?: React.CSSProperties;
            explorerActionsStyle?: React.CSSProperties;
        };
    }

    const GraphiQLExplorer: React.FC<GraphiQLExplorerProps>;
    export default GraphiQLExplorer;
}
