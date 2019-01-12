if ! [ -e Schuelerverwaltung.tar ]
  then echo missing Schuelerverwaltung.tar && echo run buildDockerContainer.sh first && exit 1
fi

docker stop mongo
docker stop schueler
docker system prune --force 

docker load -i Schuelerverwaltung.tar
docker network create --driver=bridge --gateway 172.4.0.1 --subnet=172.4.0.0/24 schuelernetz

docker run -d --net schuelernetz --ip 172.4.0.3 -e MONGO_INITDB_DATABASE=test --name mongo --restart on-failure -v /data/db mongo:latest
docker run -d -p 443:8443 --net schuelernetz --ip 172.4.0.2 --restart on-failure --name schueler schueler

sleep 3
docker exec mongo mongo --eval 'db.users.insert({ "_id" : ObjectId("5bf50baa9f09d02a1caf657a"), "username" : "admin", "password" : "$2a$10$9CEn6IyPD1glSkOIj4uFieXgrnAYEzsYHrzK6Xk.gE2nsG0NdQP0a", "rolle" : "Admin",     "__v" : 0 })'
