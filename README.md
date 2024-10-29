# Телефонный справочник

## Инструкция по запуску
#### Через docker-compose

<code>docker-compose up --build</code>

#### Чтобы крутился на фоне
<code>docker-compose up --build -d</code>

#### Если нету вохможности скачать образ, то берем его из архива
перед запуском образа 
<code>docker load -i nginx.tar</code>