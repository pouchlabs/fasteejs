<script>
    import {Provider,Layout,Code} from "@pouchlab/ui";
    let {children}=$props();
</script>
<Provider>
    <Code>j</Code>
    {@render children?.()}
</Provider>