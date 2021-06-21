import { defineComponent, DefineComponent, ref, watch, shallowRef, nextTick } from 'vue';
export type PortalPair = [key: string, component: DefineComponent];

const getId = (pairs: PortalPair[]) => pairs.map((p) => p[0]).join('\n');

export const Portals = defineComponent((props: { portals: PortalPair[] }) => {
    const portalComponents = shallowRef<Array<DefineComponent>>([]);
    const prev = ref<string>('');
    const renderList = shallowRef<() => JSX.Element[] | null>(() => null);

    watch(
        () => getId(props.portals),
        (ids) => {
            if (ids !== prev.value) {
                prev.value = ids;
                const next = props.portals.map((p) => p[1]);
                portalComponents.value = next;
            }
        },
    );

    nextTick(() => {
        renderList.value = () => portalComponents.value.map((P) => <P />);
    });

    return () => {
        return <>{renderList.value()}</>;
    };
});
Portals.props = ['portals'];
