namespace LocalisationApi.Models;

public class DossierLocalisation
{
    public int Id { get; set; }
    public string DateReception { get; set; } = "";
    public string StatutLocalisation { get; set; } = "EnCours";
    public string TypeLocalisation { get; set; } = "Reference";
    public string AdresseInvestiguer { get; set; } = "";
    public string DateMiseAJour { get; set; } = "";
    public Reserviste? Reserviste { get; set; }
    public CampagneLocalisation? Campagne { get; set; }
    public Brigade? Brigade { get; set; }
    public List<PV> Pvs { get; set; } = new();
    public List<Bordereau> Bordereaux { get; set; } = new();
    public List<HistoriqueAction> Historique { get; set; } = new();
}
