# Feature: Model management from Provider

- [ ] Should be able to add a new Provider URL
- [ ] Should be able to fetch models available from that provider
- [ ] Should allow me to select which models I would like to use (this will show in the dropdown)
- [ ] Should be able to select the default model for this provider

## Model & table structure

- [Provider]
  - id
  - name
  - url
  - type (openai, hugging face, etc.)

- [Provider Models]
  - id
  - provider_id
  - name
  - provider
  - default (boolean)

## Technical details
- To add a new provider, will enter the name and the URL in a form.
- Once saved, user should be able to fetch the list of models.
- A button should allow sync of models. If there are new models, then add and if something is removed then delete.
- User should be able to select a default model from the list. If the default model is deleted, user needs to select new.
