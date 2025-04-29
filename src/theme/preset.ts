import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },
    },
    // 添加Button组件的自定义样式
    components: {
        button: {
            root: {
                borderRadius: '0.3rem',
                paddingX: '0.6rem',
                paddingY: '0.2rem',
            },
            text: {
                primary: {
                    color: '{blue.500}',
                },
            }
        },
        divider: {
            root: {
                borderColor: '{gray.200}',
            }
        },
        card: {
            root: {
                background: '{gray.100}',
            }
        },
        galleria: {
            root: {
                borderWidth: '0',
            },
            thumbnailsContent: {
                padding: '0.5rem',

            },
        },
    }
});

export { MyPreset };