docker rmi schueler
docker build . -t schueler:latest
docker save schueler > ../docker/Schuelerverwaltung.tar
