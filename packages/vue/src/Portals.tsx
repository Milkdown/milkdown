import { defineComponent, DefineComponent, ref, watch, computed, shallowRef, Teleport } from 'vue';
export type PortalPair = [key: string, component: DefineComponent, dom: HTMLElement];

const getId = (pairs: PortalPair[]) => pairs.map((p) => p[0]).join('\n');

export const Portals = defineComponent((props: { portals: PortalPair[] }) => {
    const portalComponents = shallowRef<Array<[Component: DefineComponent, dom: HTMLElement]>>([]);
    const prev = ref<string>('');

    watch(
        () => getId(props.portals),
        (ids) => {
            console.log('prev', prev.value);
            console.log('next', ids);
            if (prev.value === '') {
                prev.value = ids;
                // portalComponents = [...props.portals].map((p) => [p[1], p[2]]);
                const next = props.portals.map(([_, p, d]) => [p, d] as [DefineComponent, HTMLElement]);
                // portalComponents.splice(0, portalComponents.length, ...next);
                portalComponents.value = next;
                return;
            }
            console.log('prev', prev.value);
            console.log('next', ids);
            if (ids !== prev.value) {
                prev.value = ids;
                // nextTick(() => {
                //     portalComponents.value = [...props.portals].map((p) => [p[1], p[2]]);
                // });
                // portalComponents.value.splice(
                //     0,
                //     portalComponents.value.length,
                //     ...portals.map((portalPair) => portalPair[1]),
                // );
            }
        },
    );

    const renderList = computed(() => {
        return () =>
            portalComponents.value.map(([P, dom]) => (
                <Teleport to={dom}>
                    <P />
                </Teleport>
            ));
    });

    return () => {
        return (
            <>
                {/* {next} */}
                {renderList.value()}
                {/* {portalComponents.map((P) => (
                <P />
            ))} */}
            </>
        );
    };
});
Portals.props = ['portals'];
