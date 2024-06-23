const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

router.post('/scaffold', async (req, res) => {
  let { projectPath, selectedFramework, selectedStack } = req.body;

  if (!projectPath) {
    return res.status(400).send({ error: 'Project path is required' });
  }

  const projectName = path.basename(projectPath);

  if (/[A-Z]/.test(projectName)) {
    projectPath = path.join(path.dirname(projectPath), projectName.toLowerCase());
    return res.status(400).send({
      error: 'Project name cannot contain capital letters. Please choose a different project name or use the following:',
      suggestedPath: projectPath
    });
  }

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }

  let scaffoldCommand = '';
  let installCommand = '';

  switch (selectedFramework) {
    case 'React':
      scaffoldCommand = `cd ${projectPath} && npx create-react-app .`;
      break;
    case 'Vue':
      installCommand = 'npm install -g @vue/cli';
      scaffoldCommand = `cd ${projectPath} && vue create .`;
      break;
    case 'Angular':
      installCommand = 'npm install -g @angular/cli';
      scaffoldCommand = `cd ${projectPath} && ng new .`;
      break;
    case 'Svelte':
      scaffoldCommand = `cd ${projectPath} && npx degit sveltejs/template . && npm install`;
      break;
    case 'Next.js':
      scaffoldCommand = `cd ${projectPath} && npx create-next-app .`;
      break;
    case 'Nuxt.js':
      scaffoldCommand = `cd ${projectPath} && npx create-nuxt-app .`;
      break;
    case 'Gatsby':
      scaffoldCommand = `cd ${projectPath} && npx gatsby new .`;
      break;
    case 'Flask':
      scaffoldCommand = `
        cd ${projectPath} &&
        python -m venv venv &&
        source venv/bin/activate &&
        pip install flask &&
        echo "from flask import Flask\napp = Flask(__name__)\n\n@app.route('/')\ndef home():\n  return 'Hello, Flask!'\n\nif __name__ == '__main__':\n  app.run(debug=True)" > app.py
      `;
      break;
    case 'Django':
      scaffoldCommand = `
        cd ${projectPath} &&
        python -m venv venv &&
        source venv/bin/activate &&
        pip install django &&
        django-admin startproject mysite
      `;
      break;
    case 'Laravel':
      scaffoldCommand = `cd ${projectPath} && composer create-project --prefer-dist laravel/laravel .`;
      break;
    case 'Ruby on Rails':
      scaffoldCommand = `cd ${projectPath} && rails new .`;
      break;
    case 'Express':
      scaffoldCommand = `
        cd ${projectPath} &&
        npm init -y &&
        npm install express &&
        echo "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello, Express!'));\napp.listen(3000, () => console.log('Server running'));" > index.js
      `;
      break;
    case 'Spring':
      scaffoldCommand = `cd ${projectPath} && spring init --dependencies=web .`;
      break;
    case '.NET':
      scaffoldCommand = `cd ${projectPath} && dotnet new web`;
      break;
    case 'NestJS':
      scaffoldCommand = `cd ${projectPath} && npx @nestjs/cli new .`;
      break;
    case 'Electron':
      scaffoldCommand = `
        cd ${projectPath} &&
        npm init -y &&
        npm install electron &&
        echo "const { app, BrowserWindow } = require('electron');\napp.on('ready', () => {\n  const win = new BrowserWindow({ width: 800, height: 600 });\n  win.loadFile('index.html');\n});" > main.js &&
        echo "<!DOCTYPE html><html><head><title>Hello Electron</title></head><body><h1>Hello, Electron!</h1></body></html>" > index.html
      `;
      break;
    case 'Strapi':
      scaffoldCommand = `cd ${projectPath} && npx create-strapi-app . --quickstart`;
      break;
    case 'WordPress':
      scaffoldCommand = `
        cd ${projectPath} &&
        curl -O https://wordpress.org/latest.tar.gz &&
        tar -xzf latest.tar.gz &&
        mv wordpress/* . &&
        rm -rf wordpress latest.tar.gz
      `;
      break;
    default:
      if (selectedStack) {
        switch (selectedStack) {
          case 'MERN':
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && npx create-react-app . &&
              cd ../server && npm init -y && npm install express mongoose dotenv &&
              echo "const express = require('express');\nconst mongoose = require('mongoose');\nconst app = express();\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'MEAN':
            installCommand = 'npm install -g @angular/cli';
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && ng new . &&
              cd ../server && npm init -y && npm install express mongoose dotenv &&
              echo "const express = require('express');\nconst mongoose = require('mongoose');\nconst app = express();\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'PERN':
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && npx create-react-app . &&
              cd ../server && npm init -y && npm install express pg sequelize &&
              echo "const express = require('express');\nconst { Sequelize } = require('sequelize');\nconst app = express();\nconst sequelize = new Sequelize('postgres://user:pass@localhost:5432/dbname');\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'T3':
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && npx create-next-app . &&
              cd ../server && npm init -y && npm install express t3 &&
              echo "const express = require('express');\nconst t3 = require('t3');\nconst app = express();\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'LAMP':
            scaffoldCommand = `
              cd ${projectPath} &&
              echo "<?php phpinfo(); ?>" > index.php &&
              echo "<VirtualHost *:80>\nDocumentRoot \\"${projectPath}\\"\n<Directory \\"${projectPath}\\">\nAllowOverride All\nRequire all granted\n</Directory>\n</VirtualHost>" > ${projectPath}/.htaccess
            `;
            break;
          case 'LEMP':
            scaffoldCommand = `
              cd ${projectPath} &&
              echo "<?php phpinfo(); ?>" > index.php &&
              echo "server {\n  listen 80;\n  server_name localhost;\n  root ${projectPath};\n  index index.php index.html index.htm;\n  location / {\n    try_files $uri $uri/ =404;\n  }\n  location ~ \\.php$ {\n    include snippets/fastcgi-php.conf;\n    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;\n  }\n  location ~ /\\.ht {\n    deny all;\n  }\n}" > ${projectPath}/nginx.conf
            `;
            break;
          case 'JAMstack':
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && npx create-react-app . &&
              cd ../server && npm init -y && npm install gatsby &&
              echo "const express = require('express');\nconst gatsby = require('gatsby');\nconst app = express();\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'MEVN':
            installCommand = 'npm install -g @vue/cli';
            scaffoldCommand = `
              cd ${projectPath} &&
              mkdir client server &&
              cd client && vue create . &&
              cd ../server && npm init -y && npm install express mongoose dotenv &&
              echo "const express = require('express');\nconst mongoose = require('mongoose');\nconst app = express();\napp.listen(5000, () => console.log('Server running'));" > index.js
            `;
            break;
          case 'Django + React':
            scaffoldCommand = `
              cd ${projectPath} &&
              python -m venv venv &&
              source venv/bin/activate &&
              pip install django &&
              django-admin startproject mysite &&
              cd mysite &&
              npx create-react-app frontend &&
              echo "INSTALLED_APPS = [\n'django.contrib.admin',\n'django.contrib.auth',\n'django.contrib.contenttypes',\n'django.contrib.sessions',\n'django.contrib.messages',\n'django.contrib.staticfiles',\n]\n\nMIDDLEWARE = [\n'django.middleware.security.SecurityMiddleware',\n'django.contrib.sessions.middleware.SessionMiddleware',\n'django.middleware.common.CommonMiddleware',\n'django.middleware.csrf.CsrfViewMiddleware',\n'django.contrib.auth.middleware.AuthenticationMiddleware',\n'django.contrib.messages.middleware.MessageMiddleware',\n'django.middleware.clickjacking.XFrameOptionsMiddleware',\n]\n\nROOT_URLCONF = 'mysite.urls'\n\nTEMPLATES = [\n{\n'BACKEND': 'django.template.backends.django.DjangoTemplates',\n'DIRS': [os.path.join(BASE_DIR, 'frontend/build')],\n'APP_DIRS': True,\n'OPTIONS': {\n'context_processors': [\n'django.template.context_processors.debug',\n'django.template.context_processors.request',\n'django.contrib.auth.context_processors.auth',\n'django.contrib.messages.context_processors.messages',\n],\n},\n},\n]\n\nSTATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/build/static')]\n" >> settings.py
            `;
            break;
          case 'Rails + React':
            scaffoldCommand = `
              cd ${projectPath} &&
              rails new backend &&
              cd backend &&
              npx create-react-app frontend &&
              echo "gem 'rack-cors', require: 'rack/cors'\n\nconfig.middleware.insert_before 0, Rack::Cors do\nallow do\norigins '*'\nresource '*',\nheaders: :any,\nmethods: [:get, :post, :put, :patch, :delete, :options, :head]\nend\nend" >> config/application.rb
            `;
            break;
          case 'WordPress + Gatsby':
            scaffoldCommand = `
              cd ${projectPath} &&
              curl -O https://wordpress.org/latest.tar.gz &&
              tar -xzf latest.tar.gz &&
              mv wordpress/* . &&
              rm -rf wordpress latest.tar.gz &&
              npx gatsby new frontend
            `;
            break;
          case 'WordPress + Nuxt':
            scaffoldCommand = `
              cd ${projectPath} &&
              curl -O https://wordpress.org/latest.tar.gz &&
              tar -xzf latest.tar.gz &&
              mv wordpress/* . &&
              rm -rf wordpress latest.tar.gz &&
              npx create-nuxt-app frontend
            `;
            break;
          case 'Spring Boot + Angular':
            installCommand = 'npm install -g @angular/cli';
            scaffoldCommand = `
              cd ${projectPath} &&
              ng new frontend &&
              spring init --dependencies=web backend
            `;
            break;
          default:
            return res.status(400).send({ error: 'Invalid framework or stack' });
        }
      } else {
        return res.status(400).send({ error: 'Invalid framework or stack' });
      }
  }

  const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error: error.message, details: stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  };

  try {
    if (installCommand) {
      const installOutput = await executeCommand(installCommand);
      console.log(`Install output: ${installOutput.stdout}`);
      console.error(`Install error output: ${installOutput.stderr}`);
    }

    const output = await executeCommand(scaffoldCommand);
    console.log(`Scaffold stdout: ${output.stdout}`);
    console.error(`Scaffold stderr: ${output.stderr}`);

    const files = fs.readdirSync(projectPath);
    if (files.length === 0) {
      throw new Error('No files were created in the directory.');
    }

    res.status(200).send({ message: 'Project scaffolded successfully', output: output.stdout });
  } catch (error) {
    console.error(`Error: ${error.error}`);
    console.error(`Details: ${error.details}`);
    res.status(500).send({ error: error.error, details: error.details });
  }
});

module.exports = router;
