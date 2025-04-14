# About

This addon adds support for any AI Provider that has an API compatible with OpenAI on translator++, you can use the official OpenAI API, g4f, openrouter, etc.

## Features

Besides the tradicional engine in the Translation options, there's also a new item in the context menu containing the following:  
<br>
**Translate selected rows entirely:** Each column will contain a translation from a different model. You can choose the models in the addon options.  
<br>
**Translate selected cells with...:** Every selected cell will be translated with the selected model, without the need of going to the addon's options to manually switch between the models every time.  
<br>
<strong style="color:red">Warning: </strong>The translate selection section will translate everything in one request, if you select too much text, the translation's quality will be worse, be careful.

## Build

```bash
# build the addon
$ npm run build

# build a standalone python script for g4f local API
# packs the python code and it's dependencies into a pyz
# must run on windows to build a compatible pack
$ npm run pack
```

The output of the python pack will vary according to the machine who built it, os version and etc. You can skip this by running the g4f local API manually, or by specifiying a remote provider.  
<br>
<strong style="color:red">Important: </strong>keep your g4f package updated. since this stuff changes frequently

## Install

copy ./dist/openai to translator++/www/addons
