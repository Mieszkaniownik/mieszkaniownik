{{/*
Expand the name of the chart.
*/}}
{{- define "mieszkaniownik-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "mieszkaniownik-chart.fullname" -}}
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
{{- define "mieszkaniownik-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "mieszkaniownik-chart.labels" -}}
helm.sh/chart: {{ include "mieszkaniownik-chart.chart" . }}
{{ include "mieszkaniownik-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app: {{ .Values.app.name }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "mieszkaniownik-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mieszkaniownik-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "mieszkaniownik-chart.backend.labels" -}}
{{ include "mieszkaniownik-chart.labels" . }}
tier: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "mieszkaniownik-chart.backend.selectorLabels" -}}
{{ include "mieszkaniownik-chart.selectorLabels" . }}
tier: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "mieszkaniownik-chart.frontend.labels" -}}
{{ include "mieszkaniownik-chart.labels" . }}
tier: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "mieszkaniownik-chart.frontend.selectorLabels" -}}
{{ include "mieszkaniownik-chart.selectorLabels" . }}
tier: frontend
{{- end }}

{{/*
Database labels
*/}}
{{- define "mieszkaniownik-chart.database.labels" -}}
{{ include "mieszkaniownik-chart.labels" . }}
tier: database
{{- end }}

{{/*
Database selector labels
*/}}
{{- define "mieszkaniownik-chart.database.selectorLabels" -}}
{{ include "mieszkaniownik-chart.selectorLabels" . }}
tier: database
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "mieszkaniownik-chart.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "mieszkaniownik-chart.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database connection string
*/}}
{{- define "mieszkaniownik-chart.databaseUrl" -}}
postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@{{ include "mieszkaniownik-chart.postgresql.serviceName" . }}:5432/{{ .Values.app.name }}
{{- end }}

{{/*
Backend service name
*/}}
{{- define "mieszkaniownik-chart.backend.serviceName" -}}
{{ include "mieszkaniownik-chart.fullname" . }}-backend
{{- end }}

{{/*
Frontend service name
*/}}
{{- define "mieszkaniownik-chart.frontend.serviceName" -}}
{{ include "mieszkaniownik-chart.fullname" . }}-frontend
{{- end }}

{{/*
PostgreSQL service name
*/}}
{{- define "mieszkaniownik-chart.postgresql.serviceName" -}}
{{ include "mieszkaniownik-chart.fullname" . }}-postgresql
{{- end }}
