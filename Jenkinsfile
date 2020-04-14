pipeline {
    agent any
    
    environment {        
        WWW = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_WWW : env.VAULT_STAGING_WWW}"
        ENV = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_ENV : env.VAULT_STAGING_ENV}"
    }

    stages {
        stage('check') {
            steps {
                echo "WWW: ${WWW}"
                echo "ENV: ${ENV}"
                echo "WORKSPACE: ${WORKSPACE}"
                sh 'pwd'
                sh 'ls'

                script {
                    if("${WWW}" == "" || "${ENV}" == "" || ("${env.BRANCH_NAME}" != "master" && "${env.BRANCH_NAME}" != "develop")) {
                        println "INCORRECT VARIABLES"
                        currentBuild.result = 'FAILED'
                        failed = true
                        error "Build failed :-("
                        return
                    }
                }
            }
        }    

        stage('copy env') {
            steps {
                sh "cp -a ${ENV}/. ${WORKSPACE}"
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('deploy') {
            steps{
                sh "rm -rf ${WWW}"
                sh "mv ${WORKSPACE}/dist ${WWW}"
            }
        }
    }
}