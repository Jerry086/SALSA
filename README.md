# Spatiotemporal Sound Annotation (SALSA)

The SALSA system enhances audio data analysis through a novel query-by-similarity approach integrating spatiotemporal elements into sound retrieval. This methodology aims to refine the precision and efficiency of audio data retrieval systems by employing a VGGish-based model that transforms audio into a multi-dimensional embedding, enabling nuanced examination based on acoustic properties and their spatial and temporal contexts.

## About This Application

The SALSA system is a web-based application that allows users to upload audio files and retrieve similar sounds from a database. The results are displayed based on their spatial and temporal contexts, providing users with a potential moving path to explore the soundscape.

The web application is built using React.js and Flask. The audio files are processed using the VGGish model and the embeddings are stored in a MongoDB database. The user can upload an audio file and the system will return the most similar sounds from the database.

## Host the Application

The application can be access through the following link: [SALSA](https://salsa-neon.vercel.app/).

To host it yourself, follow our release instructions - [frontend](./salsa-fe/README.md) and [backend](./salsa-be/RELEASE.md) - for all details to get you started.

## Join Our Community

We welcome contributions from the community. Start playing with the application and upload meaningful sounds with spatial and temporal contexts. We are excited to see what you can do with the SALSA system!
