namespace LocalisationApi.Models;

public class HistoriqueAction
{
    public int Id { get; set; }
    public string Date { get; set; } = "";
    public string Utilisateur { get; set; } = "";
    public string Action { get; set; } = "";
    public string Commentaire { get; set; } = "";
}
