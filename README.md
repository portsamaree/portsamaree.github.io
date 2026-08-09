# Ports à marée — pages publiques

Ce dépôt ne sert qu'à **héberger** ce que l'application doit publier en ligne.
Il ne contient pas le code de l'app.

| adresse | ce que c'est |
|---|---|
| `/` | politique de confidentialité, français et anglais |

## ⚠️ La page de confidentialité ne s'édite pas ici

`index.html` est **fabriquée** depuis le texte de l'application, par
`Outils/confidentialite/publier.py` dans le dépôt principal. Le corriger ici
serait perdu à la prochaine publication — et surtout, cela recréerait le défaut
que la génération a supprimé : deux copies d'un même texte, dont l'une finit
par mentir. Celle-ci l'a fait pendant cinq jours en août 2026, en affirmant
que l'app n'établissait aucune connexion à un serveur alors qu'elle allait
chercher les horaires d'écluses.

Pour la mettre à jour : corriger le texte dans l'app, relancer le script,
recopier le résultat ici.

## `/maj/v1/` — le canal de mise à jour

Ce que l'application va chercher pour rafraîchir les horaires d'écluses et de portes :
`manifeste.json`, ses `horaires-<n>.json`, et une signature Ed25519 par fichier.

⚠️ **`.nojekyll` À LA RACINE EST OBLIGATOIRE.** Sans lui, GitHub Pages fait passer le dépôt par
Jekyll, qui ignore certains fichiers et peut en réécrire d'autres. Un octet réécrit dans un
`.json` invalide sa signature, et l'application refuse alors **toutes** les mises à jour — en
silence, puisque c'est exactement le comportement voulu face à un fichier falsifié.

Le contenu ne s'édite pas ici : il est produit et signé par `Outils/mise-a-jour/publier.py`
dans le dépôt principal, puis poussé par `televerser.py`.
