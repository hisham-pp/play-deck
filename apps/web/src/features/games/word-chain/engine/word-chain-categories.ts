import type { WordChainCategory } from '../types/word-chain.types';

/**
 * Category Lock is deliberately curated rather than dictionary-wide: a themed
 * round is only fun when every player can picture the same set of answers.
 */
const ANIMALS = `ant antelope ape baboon badger bat bear beaver bee beetle bison boar buffalo bull
butterfly camel canary carp cat caterpillar cheetah chicken chimpanzee cobra cod condor cow coyote
crab crane cricket crocodile crow deer dingo dog dolphin donkey dove dragonfly duck eagle eel
elephant elk emu falcon ferret finch flamingo fox frog gazelle gecko gerbil giraffe goat goose
gorilla grasshopper gull hamster hare hawk hedgehog heron hippopotamus hornet horse hyena ibex
iguana impala jackal jaguar jay jellyfish kangaroo kingfisher kiwi koala lark lemur leopard lion
lizard llama lobster lynx macaw magpie mammoth manatee mantis marmot mole mongoose monkey moose
mosquito moth mouse mule newt nightingale ocelot octopus okapi opossum orangutan ostrich otter owl
ox oyster panda panther parrot partridge peacock pelican penguin pheasant pig pigeon platypus
porcupine porpoise puffin puma python quail rabbit raccoon ram rat raven reindeer rhinoceros robin
rooster salamander salmon sardine scorpion seahorse seal shark sheep shrew shrimp skunk sloth snail
snake sparrow spider squid squirrel starfish stork swan swift tapir termite tiger toad tortoise
toucan trout tuna turkey turtle viper vulture wallaby walrus wasp weasel whale wolf wombat
woodpecker worm yak zebra`;

const FOOD = `almond anchovy apple apricot artichoke asparagus aubergine avocado bacon bagel baguette
banana barley basil bean beef beetroot biscuit blackberry blueberry bread brie broccoli broth brownie
burger butter cabbage cake caramel carrot cashew cauliflower celery cereal cheddar cheese cherry
chestnut chicken chilli chocolate chowder chutney cider cinnamon clam cocoa coconut coffee cookie
coriander corn couscous crab cracker cranberry cream crepe croissant cucumber cumin curry custard
date dumpling egg fennel fig fish flour garlic gelato ginger grape gravy guava haddock ham honey
hummus jam jelly juice kale ketchup kiwi lamb lasagne leek lemon lentil lettuce lime lobster mango
maple marzipan mayonnaise melon meringue milk mint muffin mushroom mussel mustard naan nectarine
noodle nougat nutmeg oat olive omelette onion orange oregano oyster pancake papaya paprika parsley
parsnip pasta pastry pea peach peanut pear pecan pepper pesto pickle pie pineapple pistachio pizza
plum popcorn pork porridge potato prawn pretzel pudding pumpkin quiche quinoa radish raisin raspberry
rhubarb rice risotto rosemary saffron sage salad salami salmon salsa sandwich sardine sauce sausage
scone seaweed sesame sherbet shrimp sorbet soup spaghetti spinach squash steak stew strawberry sugar
sushi syrup taco tangerine tea thyme toast tofu tomato tortilla truffle tuna turkey turnip vanilla
vinegar waffle walnut wasabi watermelon wheat yoghurt yam zucchini`;

const PLACES = `airport alley apartment aquarium arcade arena attic bakery balcony bank barn basement
bay beach bedroom borough bridge bunker cabin cafe campsite canal canyon capital castle cathedral
cave cellar chapel church cinema city cliff clinic college continent corridor cottage country
courtyard creek dam desert diner dock dormitory dungeon embassy estate factory farm ferry field
forest fortress fountain gallery garage garden gate glacier gorge greenhouse grotto gym habour
hamlet harbour harbor hall hangar haven highway hill hospital hostel hotel house hut igloo inn
island jetty jungle kingdom kitchen laboratory lagoon lake landmark lane library lighthouse lobby
lodge loft lounge mall mansion market marsh meadow mine mosque motel mountain museum nursery oasis
observatory ocean office orchard palace park parlour pasture path patio pavilion peninsula pier
plain plateau playground plaza pond pool port prairie province pub pyramid quarry quay ranch reef
reservoir restaurant ridge river road ruin school sea shed shore shrine sidewalk square stable
stadium station store street studio suburb subway summit swamp synagogue temple terrace theatre
tower town trail tunnel valley vault village vineyard volcano wall warehouse waterfall wharf
wilderness woodland yard zoo`;

const OBJECTS = `anchor anvil apron armchair axe backpack bag ball balloon bandage barrel basket
bathtub battery beacon bell belt bench bicycle binder binoculars blanket blender blind board bobbin
bolt book boot bottle bowl box bracelet bracket brick bridle broom brush bucket bulb button cable
camera can candle cane canvas cap card carpet cart cauldron chain chair chalk charger chest chisel
clamp clip clock cloth coat coin comb compass container cord cork corkscrew cot couch cradle crane
crate crayon crowbar crown cup curtain cushion dagger desk diary dish doll door drawer drill drum
easel engine envelope eraser fan faucet feather fence file flag flask flute fork frame funnel
furnace gauge gear glass glove glue goggles gong grate grill guitar hammer handle hanger harness
hat helmet hinge hoe hook hose hourglass iron jacket jar jug kettle key keyboard kite knife ladder
lamp lantern laptop lasso latch leash lens lever lid lock locker magnet mallet map marble mask mat
mattress medal microphone mirror mixer monitor mop mug nail napkin necklace needle net notebook
nozzle oar oven padlock paddle pail paint pan panel paper parcel pebble pedal pen pencil pendant
pillow pin pipe pistol piston plank plate pliers plug pocket pole pot pouch printer prism pump
puppet purse puzzle quill quilt quiver radio raft rag rake ramp razor receipt reel remote ribbon
ring rivet robe rocket rod rope rubber rug ruler sack saddle safe sail sandal saucer saw scaffold
scale scarf scissors screen screw screwdriver scroll seal seat shawl shears sheet shelf shield shoe
shovel shutter sieve sign sink skate ski sleeve slipper socket sofa spade spanner speaker spear
spectacles spindle spoon spring stamp stapler statue stethoscope stick stool stove strap straw
stretcher string suitcase sweater switch sword syringe table tablet tank tape tarpaulin teapot
telescope tent thermometer thimble thread throne ticket tile tin tissue toaster tongs toolbox
torch towel toy tractor trailer tray trolley trophy trousers trowel trumpet tube tweezers
typewriter umbrella urn valve vase vest violin vise wagon wallet wand wardrobe watch weight
wheel whisk whistle wig window wire wrench yoke zipper`;

function toSet(block: string): ReadonlySet<string> {
  return new Set(block.split(/\s+/).filter(Boolean));
}

export const CATEGORY_WORDS: Record<WordChainCategory, ReadonlySet<string>> = {
  animals: toSet(ANIMALS),
  food: toSet(FOOD),
  places: toSet(PLACES),
  objects: toSet(OBJECTS),
};

export function isInCategory(word: string, category: WordChainCategory): boolean {
  return CATEGORY_WORDS[category].has(word);
}

export function categoryWordsStartingWith(category: WordChainCategory, prefix: string): string[] {
  return [...CATEGORY_WORDS[category]].filter((word) => word.startsWith(prefix));
}
