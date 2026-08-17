{{- define "planning-poker.labels" -}}
app.kubernetes.io/name: planning-poker
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
