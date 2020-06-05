pipeline {
    agent any
    
    environment {        
        WWW = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_WWW : env.VAULT_STAGING_WWW}"
        ENV = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_ENV : env.VAULT_STAGING_ENV}"
    }

    stages {
        stage('check') {
            steps {
                script {
                    if("${WWW}" == "" || "${ENV}" == "") {
                        currentBuild.result = 'FAILED'
                        error "No valid deploy dirs"
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

        stage('build') {
            steps {
                sh 'yarn'
                sh 'yarn build'
            }
        }

        stage('stats') {
            steps {
                sh "mkdir -p ${WORKSPACE}/dist/stats"
                sh "git log --pretty=format:'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n},' > ${WORKSPACE}/dist/stats/git.json"
            }
        }

        stage('deploy') {
            when {
                anyOf { branch 'master'; branch 'develop' }
            }

            steps {
                sh "rm -rf ${WWW}"
                sh "mv ${WORKSPACE}/dist ${WWW}"
            }
        }

    }
}