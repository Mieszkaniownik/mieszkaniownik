{{/*
Expand the name of the chart.
*/}}
{{- define "mieszkaniownik-frontend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "mieszkaniownik-frontend.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "mieszkaniownik-frontend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "mieszkaniownik-frontend.labels" -}}
helm.sh/chart: {{ include "mieszkaniownik-frontend.chart" . }}
{{ include "mieszkaniownik-frontend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: frontend
app.kubernetes.io/part-of: mieszkaniownik
{{- end }}

{{/*
Selector labels
*/}}
{{- define "mieszkaniownik-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mieszkaniownik-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "mieszkaniownik-frontend.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "mieszkaniownik-frontend.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create nginx config name
*/}}
{{- define "mieszkaniownik-frontend.nginxConfigName" -}}
{{- printf "%s-nginx-config" (include "mieszkaniownik-frontend.fullname" .) }}
{{- end }}

{{/*
Create app config name
*/}}
{{- define "mieszkaniownik-frontend.configName" -}}
{{- printf "%s-config" (include "mieszkaniownik-frontend.fullname" .) }}
{{- end }}