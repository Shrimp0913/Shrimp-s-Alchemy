import re

# Element definitions to add: (id, name, svg_path, fallback_path)
element_defs = [
    ('egg', 'egg', 'icons/egg.svg', None),
    ('crow', 'crow', 'icons/crow.svg', None),
    ('gem', 'gem', 'icons/gem.svg', None),
    ('blender', 'blender', 'icons/blender.svg', None),
    ('bucket', 'bucket', 'icons/bucket.svg', 'icons/utility-can.svg'),
    ('sheep', 'sheep', 'icons/sheep.svg', None),
]

recipes_to_add = [
    ('chicken', 'seed', 'egg'),
    ('bird', 'night', 'crow'),
    ('coal', 'pressure', 'gem'),
    ('blade', 'glass', 'blender'),
    ('metal', 'metal', 'bucket'),
    ('animal', 'cloud', 'sheep'),
]

def read_svg(path, fallback=None):
    try:
        with open(path) as f:
            content = f.read().strip()
    except FileNotFoundError:
        if fallback:
            with open(fallback) as f:
                content = f.read().strip()
        else:
            raise
    # Single-line for JS string literal
    return content.replace('\n', ' ').replace('\r', '').replace("'", "\\'")

# Build element lines
new_element_lines = []
for id, name, path, fallback in element_defs:
    svg = read_svg(path, fallback)
    new_element_lines.append(
        f"    elements['{id}'] = {{ id: '{id}', name: '{name}', icon: '{svg}', discovered: false }};"
    )

# Build recipe lines
new_recipe_lines = [f"    _addRecipe('{a}', '{b}', '{result}');" for a, b, result in recipes_to_add]

with open('app.js') as f:
    js = f.read()

# Insert element definitions after elements['cactus']
insert_after_element = "    elements['cactus'] = { id: 'cactus', name: 'cactus', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" style=\"display:block;width:1.2em;height:1.2em;\"><path fill=\"currentColor\" d=\"M320 64C337.7 64 352 78.3 352 96L352 128C352 145.7 337.7 160 320 160C302.3 160 288 145.7 288 128L288 96C288 78.3 302.3 64 320 64zM256 192C256 174.3 270.3 160 288 160L352 160C369.7 160 384 174.3 384 192L384 576L256 576L256 192zM192 224C209.7 224 224 238.3 224 256L224 320C224 337.7 209.7 352 192 352C174.3 352 160 337.7 160 320L160 256C160 238.3 174.3 224 192 224zM448 224C465.7 224 480 238.3 480 256L480 320C480 337.7 465.7 352 448 352C430.3 352 416 337.7 416 320L416 256C416 238.3 430.3 224 448 224z\"/></svg>', discovered: false };"

if insert_after_element not in js:
    raise RuntimeError("Could not find cactus element definition insertion point")

js = js.replace(
    insert_after_element,
    insert_after_element + '\n' + '\n'.join(new_element_lines),
    1
)

# Insert recipes after encrypted recipe block
insert_after_recipes = "    JSON.parse(_0s).forEach(function(r) { _addRecipe(r[0], r[1], r[2]); });"
if insert_after_recipes not in js:
    raise RuntimeError("Could not find encrypted recipe block insertion point")

js = js.replace(
    insert_after_recipes,
    insert_after_recipes + '\n\n    // Additional recipes\n' + '\n'.join(new_recipe_lines),
    1
)

with open('app.js', 'w') as f:
    f.write(js)

print("Added elements and recipes:")
for id, name, _, _ in element_defs:
    print(f"  - {id}")
for a, b, result in recipes_to_add:
    print(f"  - {a} + {b} = {result}")
